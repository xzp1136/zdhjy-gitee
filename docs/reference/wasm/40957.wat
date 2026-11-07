  (func (;40957;) (type 0) (param i32 i32) (result i32)
    (local i32 i32)
    i32.const 0
    local.set 1
    i32.const 4365078
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3383752
      call 2180
      i32.const 4365078
      i32.const 1
      i32.store8
    end
    i32.const -1
    local.set 2
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load offset=8
          br_table 0 (;@3;) 0 (;@3;) 1 (;@2;) 2 (;@1;)
        end
        local.get 0
        i32.load offset=16
        local.set 1
        local.get 0
        i32.const -1
        i32.store offset=8
        block  ;; label = @3
          local.get 1
          i32.load offset=216
          i32.load offset=16
          i32.const 0
          i32.le_s
          if  ;; label = @4
            i32.const 1
            local.set 2
            local.get 1
            i32.load offset=192
            br_if 1 (;@3;)
            local.get 1
            i32.load8_u offset=188
            br_if 1 (;@3;)
            i32.const 2
            local.set 2
            local.get 1
            i32.const 0
            call 44436
            local.set 3
            br 1 (;@3;)
          end
          local.get 1
          i32.const 0
          call 44434
          i32.const 1
          local.set 2
        end
        local.get 0
        local.get 3
        i32.store offset=12
        i32.const 1
        local.set 1
      end
      local.get 0
      local.get 2
      i32.store offset=8
    end
    local.get 1)
