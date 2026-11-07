  (func (;41079;) (type 0) (param i32 i32) (result i32)
    (local i32 i32)
    local.get 0
    i32.load offset=16
    local.set 1
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load offset=8
            br_table 0 (;@4;) 1 (;@3;) 2 (;@2;) 3 (;@1;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          local.get 1
          i32.const 0
          i32.store8 offset=32
          i32.const 4365142
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3367952
            call 2180
            i32.const 4365142
            i32.const 1
            i32.store8
          end
          i32.const 3367952
          i32.load
          call 1900
          local.tee 2
          local.get 1
          i32.store offset=16
          local.get 2
          i32.const 0
          i32.store offset=8
          local.get 0
          local.get 1
          local.get 2
          i32.const 0
          call 48887
          i32.store offset=24
          local.get 0
          i32.load offset=20
          local.set 3
          i32.const 4365139
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3367944
            call 2180
            i32.const 4365139
            i32.const 1
            i32.store8
          end
          i32.const 3367944
          i32.load
          call 1900
          local.tee 2
          local.get 1
          i32.store offset=20
          local.get 2
          i32.const 0
          i32.store offset=8
          local.get 2
          local.get 3
          i32.store offset=16
          local.get 1
          local.get 2
          i32.const 0
          call 48887
          local.set 1
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
        i32.const 2
        i32.store offset=8
        local.get 0
        local.get 0
        i32.load offset=24
        i32.store offset=12
        i32.const 1
        return
      end
      local.get 0
      i32.const -1
      i32.store offset=8
      local.get 1
      i32.const 1
      i32.store8 offset=32
      local.get 1
      i32.const 0
      call 49305
      f32.store offset=56
      local.get 1
      i32.const 0
      call 49305
      f32.store offset=52
      local.get 1
      local.get 0
      call 41060
    end
    i32.const 0)
