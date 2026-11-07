  (func (;41019;) (type 0) (param i32 i32) (result i32)
    (local f32)
    i32.const 4365120
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3365220
      call 2180
      i32.const 4365120
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=16
    local.set 1
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load offset=8
          br_table 0 (;@3;) 1 (;@2;) 2 (;@1;)
        end
        local.get 0
        i32.const -1
        i32.store offset=8
        local.get 1
        f32.load offset=32
        local.get 1
        f32.load offset=36
        i32.const 0
        call 48613
        local.set 2
        i32.const 3365220
        i32.load
        call 1900
        local.tee 1
        local.get 2
        i32.const 0
        call 2408
        local.get 0
        i32.const 1
        i32.store offset=8
        local.get 0
        local.get 1
        i32.store offset=12
        i32.const 1
        return
      end
      local.get 0
      i32.const -1
      i32.store offset=8
      local.get 1
      i32.const 0
      i32.store offset=76
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.load offset=52
          br_table 0 (;@3;) 1 (;@2;) 2 (;@1;)
        end
        local.get 1
        local.get 0
        call 41007
        i32.const 0
        return
      end
      local.get 1
      local.get 0
      call 41002
    end
    i32.const 0)
