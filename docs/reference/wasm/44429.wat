  (func (;44429;) (type 8) (param i32 i32 i32 i32) (result i32)
    local.get 2
    local.get 1
    i32.store
    i32.const 0
    local.set 3
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 1
              i32.const 1
              i32.sub
              br_table 0 (;@5;) 1 (;@4;) 2 (;@3;) 4 (;@1;)
            end
            local.get 0
            i32.const 0
            i32.const 0
            local.tee 1
            call 44407
            br_if 2 (;@2;)
            br 3 (;@1;)
          end
          local.get 0
          i32.const 0
          i32.const 0
          local.tee 1
          call 44407
          if  ;; label = @4
            i32.const 0
            call 48615
            local.get 0
            f32.load offset=172
            f32.lt
            br_if 2 (;@2;)
          end
          local.get 0
          i32.const 1
          i32.const 1
          local.tee 1
          call 44407
          br_if 1 (;@2;)
          local.get 0
          i32.const 0
          i32.const 0
          local.tee 1
          call 44407
          br_if 1 (;@2;)
          br 2 (;@1;)
        end
        local.get 0
        i32.const 2
        i32.const 2
        local.tee 1
        call 44407
        br_if 0 (;@2;)
        local.get 0
        i32.const 1
        i32.const 1
        local.tee 1
        call 44407
        i32.eqz
        br_if 1 (;@1;)
      end
      local.get 2
      local.get 1
      i32.store
      i32.const 1
      local.set 3
    end
    local.get 3)
