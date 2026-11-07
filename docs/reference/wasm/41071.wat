  (func (;41071;) (type 0) (param i32 i32) (result i32)
    (local i32 i32)
    i32.const 4365167
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388068
      call 2180
      i32.const 3388072
      call 2180
      i32.const 3365220
      call 2180
      i32.const 4365167
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=20
    local.set 2
    block  ;; label = @1
      block (result i32)  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load offset=8
            br_table 0 (;@4;) 1 (;@3;) 3 (;@1;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          local.get 0
          i32.const 16
          i32.add
          local.get 0
          i32.load offset=16
          local.tee 1
          i32.load offset=16
          local.tee 3
          i32.const 0
          i32.le_s
          br_if 1 (;@2;)
          drop
          i32.const 3365220
          i32.load
          call 1900
          local.tee 2
          local.get 3
          f32.convert_i32_s
          i32.const 0
          call 2408
          local.get 0
          i32.const 1
          i32.store offset=8
          local.get 0
          local.get 2
          i32.store offset=12
          i32.const 1
          return
        end
        local.get 0
        i32.const -1
        i32.store offset=8
        local.get 0
        i32.load offset=16
        local.set 1
        local.get 0
        i32.const 16
        i32.add
      end
      local.set 3
      local.get 2
      i32.load offset=60
      local.get 1
      i32.const 3388068
      i32.load
      call 50441
      local.set 1
      local.get 0
      i32.load offset=16
      local.set 0
      local.get 1
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.const 0
        i32.store8 offset=33
        i32.const 0
        return
      end
      local.get 2
      local.get 0
      i32.load offset=28
      i32.const 1
      local.get 0
      call 41046
      drop
      local.get 2
      i32.load offset=60
      local.get 3
      i32.load
      i32.const 3388072
      i32.load
      call 50449
      drop
    end
    i32.const 0)
